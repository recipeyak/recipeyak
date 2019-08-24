from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from core.schemas import PubSub
from core.models import Team, MyUser
from channels.auth import get_user


def is_member_of_team(*, user: MyUser, team_id: int) -> bool:
    team = Team.objects.filter(pk=team_id).first()
    return bool(team and team.is_member(user))


class PubSubConsumer(JsonWebsocketConsumer):
    def connect(self) -> None:
        user = async_to_sync(get_user)(self.scope)

        if not user.is_authenticated:
            self.close()
            return

        self.accept()

    def disconnect(self, close_code) -> None:
        if getattr(self, "group_name", None):
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name, self.channel_name
            )

    def receive_json(self, content: dict) -> None:
        pubsub_message = PubSub(message=content)
        if pubsub_message.message.type == "subscribe":
            event = pubsub_message.message.data.event
            if event == "schedule_presence":
                team_id = pubsub_message.message.data.team_id
                user = async_to_sync(get_user)(self.scope)
                if is_member_of_team(user=user, team_id=team_id):
                    self.group_name = f"schedule_presence.{team_id}"
                    async_to_sync(self.channel_layer.group_add)(
                        self.group_name, self.channel_name
                    )

    def broadcast_message(self, event: dict) -> None:
        """
        send message presence update to consumer owner
        """
        self.send_json(
            {
                "type": "publish",
                "data": {
                    "event": "schedule_presence",
                    "team_id": event["team_id"],
                    "user": {
                        "id": event["user"]["id"],
                        "avatarURL": event["user"]["avatar_url"],
                        "email": event["user"]["email"],
                    },
                },
            }
        )

