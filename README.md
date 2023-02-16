# Sites connectivity test cli-tool

## Getting started

```sh
npm install
npm run build
chmod +x ./dist/index.js
npm link
```

## Then you ready to use the tool

```sh
site-conn --file <json.file>
```

## When you done testing run

```sh
npm unlink
```

## Sites config json file structure

```json
{
    "https://example.com": {
        "protocols": ["http", "https", "dns"],
        "threshold": 10000
    }
    //...
}
```

## Output json file structure

```json
"https://example.com": {
    "dns": {
      "success": true,
      "value": "[\"93.184.216.34\"]",
      "error": ""
    },
    "http": {
      "success": true,
      "value": 734.378631,
      "error": "",
    },
    "https": {
      "success": true,
      "value": 1009.884432,
      "error": "",
    }
    //....
}
```

## TODO

-   improve logs, add timestamp.
-   add timeout option to site config.
