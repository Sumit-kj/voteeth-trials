rsynch -r src/ docs/
rsynch build/contracts/ChainList.json docs/
git add .
git commit -m "Front End Deployment"
git push
