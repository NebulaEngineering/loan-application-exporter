# loan-application-exporter


## SET TIMESTAMP AND MONGO CONNSTR at .env

```
FORM_APPLICATION_SEARCH_FROM_TIMESTAMP=1562365613049
MONGODB_URL=mongodb://root:PASSWORD@127.0.0.1:27017/admin
```

## FORWARD POD PORTS TO LOCAL HOST

```shell
kubectl  port-forward loan-application-db-mongodb-597677df49-cgr5j 27017:27017
```

## RUN

```shell
npm start
```

## Export

Move files from __workbooks to Drive
