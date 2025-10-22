Version 0.5
Prima avventura [[Cronaca il risveglio]]

```run-javascript
console.log(@vault_path);
dicePath = path.join("@vault_path","dice.js");
console.log('@dicePath');
```


```run-javascript {label="my label"}
console.log("OK, sto usando Node");
console.log("execPath:", process.execPath);
console.log("version:", process.version);
```

```run-javascript
dicePath = path.join(@vault_path,'dice.js');
const { add } = require(dicePath);
console.log( add(2, 3) );
```

