# Translations extractor

This is a simple utility for extracting translations from excel worksheets to be used in applications that
utilize language-named translation JSON files.

usage:

`--outdir ./some-dir --columns key:0,en:1 --input 'translations_master.xlsx' --sheet someTab`

> This will retrieve the file at translate.json, extract the columns 0 and 1, using the 0 as the translation keys.
> The translations will then be extracted into a separate JSON file named en.json, and saved in the outdir directory.

| key         | en                    |
| ----------- | --------------------- |
| BUTTON_TEXT | Super special action! |
| FOO_BAR     | Foo bar baz           |

`=>`

```
{
  "BUTTON_TEXT": "Super special action!",
  "FOO_BAR": "Foo bar baz"
}
```

<hr>

## options:

- `--help`/`-h`: show this message
- `--input`/`-i`: (mandatory) the file to extract translations from
- `--outdir`/`-o`: (mandatory) the directory to store the extracted JSON files in
- `--columns`/`-c`: (mandatory) the columns to extract, and their column position: key is mandatory.
- `--sheet`/`-s`: (mandatory) the worksheet tab name to use
