docker image build -t test .; \
docker container run -d -p 8080:5000 test \