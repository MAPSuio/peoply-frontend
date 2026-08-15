# Hall of Fame

Everyone who wrote code for the Peoply frontend, split by the two homes the
repository has had: `Decidable-AS/peoply-frontend` from the first commit on
2021-12-10, and `MAPSuio/peoply-frontend` from the move on 2026-07-26.

Counts are non-merge commits on `master`, so they reflect authored work rather
than merge bubbles. Several people committed under more than one name or
address over the years; those identities are merged here, which is why the
numbers differ from a plain `git shortlog`.

## At `Decidable-AS` (2021-12-10 – 2026-07-26)

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

## At `MAPSuio` (2026-07-26 – 2026-08-15)

| # | Contributor | Commits |
|---:|---|---:|
| 1 | Victor Uhnger (`vuhnger`) | 54 |
| 2 | Martin Jørgensen (`Martiwj`) | 5 |
| 3 | Henning Osmo Nordhagen (`henningnord`) | 2 |
| 4 | Sebastian Legarraga (`slegarraga`) | 1 |

**62 commits by 4 people.** A further 19 came from `dependabot[bot]` and
`maps-self-hosted-renovate[bot]`.

Commit counts undersell two of them. Martin has also been reviewer on five
pull requests in this period, and both of Henning's commits are user-facing bug
fixes: the join button defaulting to "Meld på" when attendance is unknown, and
a clear message when an invitation can no longer be answered. Both sit on the
`maintainers` team that reviews and merges everything landing on `master`.

## Reproducing these numbers

The MAPSuio table comes straight out of this repository:

```bash
git shortlog -sn --no-merges --since=2026-07-26 master
```

The Decidable-AS table does not. Running the same command with `--until` here
gives a higher count than the table above, so those numbers stay as they were
computed in the old repository.

The command lists raw identities. To match the tables, fold these together:

- `vuhger`, `Victor Uhnger` and `Victor R. Uhnger`
- `Andreas Limi` and `andreaslimidev`
- `Magnus` and `Eckhoff42`
- `Justas Baltrukonis` and `justas1912`
- `Martiwj` and `Martin Jørgensen`

The old repository is the only place the pre-migration history exists in full.
Keep it archived rather than deleted so these numbers stay verifiable.
