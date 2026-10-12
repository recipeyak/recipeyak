FROM rust:1.99.0-bookworm@sha256:114c7a4425406451c2866b6aafe69fe29b1b298832db1277d411ac73c82d04d6 AS build

WORKDIR /var/app

COPY . .

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/var/app/target \
    cargo build --release --locked --bin recipeyak \
    && cp target/release/recipeyak /usr/local/bin/recipeyak

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:9dac0a79194e45a7da0158a9c6da57b217585af0786db3845d1f0ec1a0dd182f

COPY --from=build /usr/local/bin/recipeyak /usr/local/bin/recipeyak

CMD ["/usr/local/bin/recipeyak", "serve"]
