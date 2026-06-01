# Part 4: Git and GitHub

**Git** tracks changes to your code over time. **GitHub** hosts Git repositories online so you can collaborate, fork projects, and back up your work.

This workshop uses [FinHubSA/open-payments-express](https://github.com/FinHubSA/open-payments-express) as the upstream project. You will fork it, clone your fork, and commit a simple change.

## Install Git

Download from [https://git-scm.com/downloads](https://git-scm.com/downloads), then verify:

```bash
git --version
```

## Fork the repository on GitHub

1. Open [https://github.com/FinHubSA/open-payments-express](https://github.com/FinHubSA/open-payments-express)
2. Click **Fork** (top right)
3. Choose your GitHub account — you now have `https://github.com/YOUR_USERNAME/open-payments-express`

A fork is your copy of the project. You can experiment without affecting the original.

## Clone your fork

In VS Code terminal:

```bash
git clone https://github.com/YOUR_USERNAME/open-payments-express.git
cd open-payments-express
```

Replace `YOUR_USERNAME` with your GitHub username.

Open the folder in VS Code: **File → Open Folder**.

## Basic Git concepts

| Term | Meaning |
|------|---------|
| **Repository (repo)** | Project folder tracked by Git |
| **Commit** | A saved snapshot of your changes |
| **Branch** | Independent line of development (default: `main`) |
| **Remote** | GitHub copy of your repo (`origin`) |
| **Push** | Upload commits to GitHub |
| **Pull** | Download commits from GitHub |

## Configure Git (first time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Daily workflow

### 1. Check status

```bash
git status
```

Shows modified, staged, and untracked files.

### 2. See what changed

```bash
git diff
```

### 3. Stage changes

```bash
# Stage one file
git add README.md

# Stage all changes (use carefully)
git add .
```

### 4. Commit

```bash
git commit -m "Add my name to the workshop notes"
```

A good commit message describes **why** you changed something in one short sentence.

### 5. Push to GitHub

```bash
git push origin main
```

Refresh your fork on GitHub — your commit appears there.

## Practice exercise: commit a simple change

Complete these steps to practice the full workflow:

1. Create a file `wiki/my-notes.md` with your name and one sentence about what you learned.
2. Run `git status` — you should see `wiki/my-notes.md` as untracked.
3. Run `git add wiki/my-notes.md`
4. Run `git commit -m "Add workshop notes"`
5. Run `git push origin main`
6. On GitHub, open your fork and confirm the new file is visible.

**Do not commit:**

- `.env` (contains secrets)
- `private.key` (your wallet private key)
- `node_modules/` (already in `.gitignore`)

Check [`.gitignore`](../.gitignore) to see what Git ignores by default.

## Syncing with the original repo (optional)

If FinHubSA updates the upstream project:

```bash
git remote add upstream https://github.com/FinHubSA/open-payments-express.git
git fetch upstream
git merge upstream/main
```

## Git in VS Code

The **Source Control** icon (left sidebar) shows changed files. You can stage, commit, and push from the UI instead of the terminal.

## Next

Learn the runtime for the backend in [Part 5: Node.js](05-nodejs.md).
