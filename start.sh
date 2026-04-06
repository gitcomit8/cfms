docker compose up -d
pushd server
npm run dev&
popd
pushd client
npm run dev&
popd

