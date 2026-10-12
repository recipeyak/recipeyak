FROM lukemathwalker/cargo-chef:0.1.78-rust-1.99.0-bookworm@sha256:2ee6e8edf0b91b5a7295071299596601710bccb243bd9735e0b9abf6e114582b AS chef
WORKDIR /var/app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build
# Build dependencies in their own layer so it stays cached until Cargo.lock changes.
COPY --from=planner /var/app/recipe.json recipe.json
RUN cargo chef cook --release --locked --recipe-path recipe.json --bin recipeyak
COPY . .
RUN cargo build --release --locked --bin recipeyak

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:9dac0a79194e45a7da0158a9c6da57b217585af0786db3845d1f0ec1a0dd182f

COPY --from=build /var/app/target/release/recipeyak /usr/local/bin/recipeyak

CMD ["/usr/local/bin/recipeyak", "serve"]
