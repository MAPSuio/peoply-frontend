# Hall of Fame

Everyone who wrote code for the Peoply frontend while it lived at
`Decidable-AS/peoply-frontend`, from the first commit on 2021-12-10 until the
repository moved to `MAPSuio/peoply-frontend` on 2026-07-26.

Counts are non-merge commits on `master`, so they reflect authored work rather
than merge bubbles. Several people committed under more than one name or
address over the years; those identities are merged here, which is why the
numbers differ from a plain `git shortlog`.

| # | Contributor | Commits |
|---:|---|---:|
| 1 | Christoffer Bjelke | 148 |
| 2 | Victor Uhnger (`vuhnger`) | 142 |
| 3 | Andreas Limi (`andreaslimidev`) | 113 |
| 4 | Maximilian von Stephanides | 106 |
| 5 | Magnus (`Eckhoff42`) | 19 |
| 6 | Martin Jørgensen (`Martiwj`) | 10 |
| 7 | Preben Zahl (`Prebz98`) | 4 |
| 8 | Alexander Ramm Østgaard (`AlexOstgaard`) | 2 |
| 9 | `hansaag` | 2 |
| 10 | Justas Baltrukonis (`justas1912`) | 2 |
| 11 | Jonas Berger Nyvold | 1 |

**549 commits by 11 people.** A further 39 came from `dependabot[bot]`, which
is left out of the ranking above for obvious reasons.

## Reproducing these numbers

```bash
git shortlog -sn --no-merges master
```

That command lists raw identities. To match the table, fold these together:

- `vuhger`, `Victor Uhnger` and `Victor R. Uhnger`
- `Andreas Limi` and `andreaslimidev`
- `Magnus` and `Eckhoff42`
- `Justas Baltrukonis` and `justas1912`

The old repository is the only place the pre-migration history exists in full.
Keep it archived rather than deleted so these numbers stay verifiable.
