# How To Contribute to the Omni Gacha

## Ideas For Entries

Entry submissions are handled by a google forum.\
Do not open a pull request to modify the item and curse list CSVs.

### Bugs

If you found a bug check to see if there is an issue for it open already.\
If there isn't an open issue feel free to make one, or contact someone who can.\
If you wrote a fix for a bug open a pull request and link back to the open issue.

Minor bugfixes may be merged into dev and applied later. Major buxfixes will recive a hotfix branch and merge into main and dev.\
In the early stages of development these branches may not exist, as it's mostly just me.

Do not open pull requests for whitespace changes.

### Features

If you have an idea for a feature go ahead and fork, then pull request when it's finished.\
If it's already one of our planned features let us know before working on it.\
Please run reasonable bug testing on your code before opening a pull request.

## Branch/Comit Policy

Major changes go into a dev branch to be assembled and tested further before a release to main.\
Hotfixes can be merged directly into main.\
One branch/fork per feature (or heavily related features).\
Use merge commits, do not fast forward. (git merge --no-ff)\
Please rebase/merge and new changes in dev before opening a pull request.\
Commits can be made in any frequency, so long as it's understandable. Use your best judgement.\
Recommmended is one commit per unit of *work*.\
Obviously, do not do one mega commit or a commit per line.


# version numbering

[x].[y].[z]
- x: main version number, should increment when dev merges into main.
- y: hotfix number, should increment when a hotfix is merged into main and reset when the main version number changes.
- z: minor revision number. increments on item/curse list update. will reset on main version change. will not reset on hotfix.
