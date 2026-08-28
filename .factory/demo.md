# Pocket Reconcile demo sandbox

Open [/demo](/demo) or `/?demo=1` for a working sample ledger. It includes
Weekend cash, Daily card, three dated entries, and a completed balance
check. The main Ledger, Checks, Backup, and Settings controls work normally.

Demo records use the IndexedDB database `demo:pocket-reconcile` and all demo
preferences use `demo:`-prefixed local-storage keys. The real ledger continues
to use `pocket-reconcile` and unprefixed keys. Demo mode never reads or writes
that real namespace.

The persistent demo banner exposes **Reset demo** (restores the supplied
sample) and **Start for real** (deletes the demo database and opens the empty
real ledger). The service worker precaches `/demo/`, so the sample can be
reloaded offline after its first visit.
