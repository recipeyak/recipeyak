# Keep the version in sync with rust-toolchain.toml
FROM rust:1.97-bookworm@sha256:0e2bcaef56d041a486784e54104a81aebe0da44bd03019bd70bc0401e42e4a97 AS builder

WORKDIR /var/app

# Build dependencies in their own layer so they're cached between code changes.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src \
    && echo "fn main() {}" > src/main.rs \
    && touch src/lib.rs \
    && cargo build --release --locked \
    && rm -rf src

# Queries are checked against the cached metadata in .sqlx instead of a live database.
ENV SQLX_OFFLINE=true
COPY .sqlx .sqlx
COPY src src
# Bump mtimes so cargo doesn't reuse the placeholder build from above.
RUN touch src/main.rs src/lib.rs && cargo build --release --locked


FROM gcr.io/distroless/cc-debian12:nonroot@sha256:9dac0a79194e45a7da0158a9c6da57b217585af0786db3845d1f0ec1a0dd182f

COPY --from=builder /var/app/target/release/recipeyak /usr/local/bin/recipeyak

CMD ["/usr/local/bin/recipeyak"]
