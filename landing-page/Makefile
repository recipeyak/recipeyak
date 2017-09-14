PORT = 4000

clean:
	rm -rf ./_site/

install:
	bundle install
	npm install

dev:
	bundle exec jekyll serve &
	./node_modules/browser-sync/bin/browser-sync.js start --proxy "localhost:${PORT}" --files "_site/**/*"
	open http://localhost:${PORT}

build:
	jekyll build
