# Legacy runtime (Java Pet Store 1.3.2)

The acceptance suite reaches the legacy application at **http://localhost:8000/petstore/**
(ready path: `/petstore/index.jsp`).

## Start

```sh
# 1. The legacy source is on branch vortex/legacy-spec/sx-0001, folder legacy-source/ (not on dev).
git worktree add ../legacy-src origin/vortex/legacy-spec/sx-0001
export LEGACY_SOURCE=$PWD/../legacy-src/legacy-source
# 2. Put the unpacked J2EE 1.3.1 RI (the j2sdkee1.3.1 folder) in .vortex/legacy-runtime/ri,
#    or export J2EE_RI_DIR=<path>.
docker compose -f .vortex/legacy-runtime/compose.yaml up --build -d
```

Wait for the service to report healthy (about 2 to 3 minutes: Cloudscape, RI, setup, EAR deploy).

## What the container does

Builds with the legacy Ant files (`src/build.xml`, `setup.xml`, `setup.sh`; there is no Maven and no
wrapper), starts Cloudscape and the RI, creates the JMS queues, users and databases, and deploys the
EARs. One service holds server and database because the RI bundles Cloudscape. Port 8000 is the only
one published.

## Not in the repository

- **J2EE 1.3.1 Reference Implementation**: a Sun binary that needs licence acceptance. It provides the
  application server, Cloudscape and `deploytool`. The legacy README says binaries were left out.
- **Java 1.4**: the RI targets it. Set `JAVA_IMAGE` (default `eclipse-temurin:8-jdk`) to a 1.4 image
  if you have one; Java 8 may need extra RI start-up flags.
- **Access to the legacy branch**, which is not on `dev`.

## Status

Written without Docker in the authoring workspace, so it has not been started. `setup.sh deploy` may
need adjusting if it opens the deploytool GUI, and the `sleep` waits in the start script may need tuning.
