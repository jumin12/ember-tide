"""Build the single-file RPG exclusively from the new PixelLab asset manifest."""
from pathlib import Path
import runpy
if __name__ == "__main__":
 runpy.run_path(str(Path(__file__).with_name("build-v7.py")), run_name="__main__")
