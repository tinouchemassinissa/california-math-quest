# Identify and recover a Bip release

The home screen has **App version & recovery**. It shows the source commit, build time and whether the build used modified tracked source. `release.json` in the deployed static output also records a SHA-256 digest of the approved public content file. This is provenance, not a signed security attestation.

Studio's authenticated **Release** panel shows its own source revision and review base. A Studio revision and an app revision may differ. Studio does not claim the app was deployed. A content review PR is not a deployment receipt.

## Before a release

1. Export the family backup from each browser that holds private family work. Check the download. It includes saved learner folders, attachments, plans, lesson results and unfinished lessons for those folders. Guest nickname sessions are excluded. Keep backups privately. Exports are unencrypted unless optional passphrase protection is enabled.
2. Run `npm ci`, `npm test`, `python3 -m unittest discover -s admin -p 'test_*.py'` and `npm run build` in the exact release checkout.
3. Review the GitHub change and preview. Publishing from Studio creates a review branch/PR and never merges or deploys automatically. Use main after PR #1 is merged; a configured stacked review branch is also supported during development.
4. Record the existing deployment's saved version ID and the new version's ID. Preserve the Site audience.
5. After deployment, compare the app version to the intended source. Confirm a synthetic learner can open a lesson, resume it and export/restore a backup. A build passing does not establish a real phone passed.

## Recover the app

Use the hosting provider's previous **saved version**, with the same audience and URL. Do not erase browser data, reset accounts or replace private homework to fix a frontend release. After restoring, compare the displayed build identifier and run the synthetic lesson check again.

For a separately hosted installation without saved releases, build a previously verified commit in an isolated checkout:

```bash
git worktree add ../bip-rollback VERIFIED_COMMIT_SHA
cd ../bip-rollback
npm ci
npm run build
```

Replace `VERIFIED_COMMIT_SHA` with the recorded full SHA; do not run the placeholder literally. Deploy that checkout's `dist/` using your existing provider. Do not use `git reset --hard` on a shared Studio or development checkout.

A frontend rollback does not undo family data or a Studio database change. Keep the private Studio database and source images in the server backup process. No Studio schema migration is introduced by this release.

## Current limits

This is a manual recovery workflow, not an automatic rollback service. Publishing from Studio to GitHub and the subsequent hosting deployment remain separate. Private Studio must be updated on the server separately from the public/static app. A second-device restoration rehearsal and physical-phone animation quality checks remain necessary before school rollout.
