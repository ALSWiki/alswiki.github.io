# ALSWiki

A community-aggregated source of information about ALS and how to support those with ALS.

## Development

### Setup

```bash
git clone git@github.com:ALSWiki/alswiki.github.io.git # gh repo clone ALSWiki/alswiki.github.io if you have gh
git clone git@github.com:ALSWiki/wiki.git # gh repo clone ALSWiki/wiki if you have gh
cd wiki
python3 -m pip install -r scripts/requirements.txt
```

### Running

To run, execute ``./build`` and the output will be in ``__dist__``. You can use ``python3 -m http.server -d __dist__`` to serve the files.
