FROM grafana/k6:latest

USER root

# Install Chromium and dependencies for browser testing
RUN apk update && apk add --no-cache chromium chromium-chromedriver

# Copy the test script into the container
COPY load-test-checkout-authentication.js /home/k6/load-test-checkout-authentication.js

# Enable K6 browser mode
ENV K6_BROWSER_ENABLED=true

# Change permissions for the copied script
RUN chown k6:k6 /home/k6/load-test-checkout-authentication.js

USER k6

#docker run --rm --privileged --sysctl net.ipv4.ip_local_port_range="1024 65535" --sysctl net.ipv4.tcp_tw_reuse=1 --sysctl net.ipv4.tcp_timestamps=1 --ulimit -n 250000 -it -v $(pwd)/load-test-checkout-authentication.js:/home/k6/load-test-checkout-authentication.js k6-browser run /home/k6/load-test-checkout-authentication.js
# docker run --rm \
#   --privileged \
#   --sysctl net.ipv4.ip_local_port_range="1024 65535" \
#   --sysctl net.ipv4.tcp_tw_reuse=1 \
#   --sysctl net.ipv4.tcp_timestamps=1 \
#   --ulimit nofile=250000:250000 \
#   -v $(pwd)/load-test-checkout-authentication.js:/home/k6/load-test-checkout-authentication.js \
#   k6-browser  run /home/k6/load-test-checkout-authentication.js




#   docker run --rm \
#   --privileged \
#   --sysctl net.ipv4.ip_local_port_range="1024 65535" \
#   --sysctl net.ipv4.tcp_tw_reuse=1 \
#   --sysctl net.ipv4.tcp_timestamps=1 \
#   -v $(pwd)/load-test-checkout-authentication.js:/home/k6/load-test-checkout-authentication.js \
#   k6-browser  run /home/k6/load-test-checkout-authentication.js