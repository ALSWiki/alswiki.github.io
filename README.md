# ALSWiki

A community-aggregated source of information about ALS and how to support those with ALS.

## Development

### Setup

```bash
git clone git@github.com:ALSWiki/wiki.git
cd wiki
python3 -m pip install -r scripts/requirements.txt
```

### Running

To run, execute ``./build`` and the output will be in ``__dist__``. You can use ``python3 -m http.server -d __dist__`` to serve the files.
