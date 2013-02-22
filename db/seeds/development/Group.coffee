Group.seed ->
    id: 1
    url: 'localhost:3000'
    path: ''
    name: 'Dev Group'
    subgroups: [{"path":"/extranet","id":2}]
    pagesCache: [{"id":1,"title":"Dev Group","url":"localhost:3000","order":null,"level":0,"parentId":null,"type":null,"hideFromNavigation":null}]
    homepage: {"id":"1","title":"Dev Group","url":"localhost:3000","order":null,"parentId":null,"type":null,"hideFromNavigation":null}
    modules: [{"name":"user","contract":{"google":true,"local":true}},
      {"name":"admin"},{"name":"core"},{"name":"stylesheet"},
      {"name":"core-widgets"},{"name":"content"}]

Group.seed ->
    id: 2
    url: 'localhost:3000/extranet'
    path: '/extranet'
    name: 'Extranet'
    subgroups: null
    pagesCache: [{"id":2,"title":"Extranet","url":"localhost:3000/extranet","order":null,"level":0,"parentId":null,"type":null,"hideFromNavigation":null}]
    homepage: {"id":5,"title":"Extranet","url":"localhost:3000/extranet","order":null,"parentId":null,"type":null,"hideFromNavigation":null}
    modules: [{"name":"user","contract":{"google":true,"local":true}},
      {"name":"admin"},{"name":"core"},{"name":"stylesheet"},
      {"name":"core-widgets"},{"name":"content"}]
