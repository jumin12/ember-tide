"""Build the current Elyndor game. Legacy build tools live in archive/."""
from pathlib import Path
import runpy, sys
if '--preview' in sys.argv:
    sys.argv.remove('--preview')
elif '--final' not in sys.argv:
    sys.argv.append('--final')
runpy.run_path(str(Path(__file__).resolve().parents[1] / 'elyndor/tools/build.py'), run_name='__main__')
