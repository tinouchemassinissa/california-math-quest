"""Pure trajectory checks; rendering and pose review are separate checks."""
import importlib.util
import math
from pathlib import Path
import sys
import types
import unittest

# Pose equations can be checked without installing Blender in the app runtime.
sys.modules.setdefault('bpy', types.ModuleType('bpy'))
spec = importlib.util.spec_from_file_location('school_gestures', Path(__file__).with_name('render_school_gestures.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Gestures(unittest.TestCase):
    def test_every_take_returns_to_the_same_neutral_pose(self):
        neutral = module.pose('idle', 0)
        for take in module.TAKES:
            self.assertEqual(module.pose(take, 0), neutral)
            self.assertEqual(module.pose(take, 1), neutral)

    def test_sampled_values_are_finite_and_bounded(self):
        for take in module.TAKES:
            for frame in range(module.FRAMES):
                p = module.pose(take, frame/(module.FRAMES-1))
                self.assertGreaterEqual(p['eyes'], .07)
                self.assertLessEqual(p['eyes'], 1)
                for part in ('head', 'body', 'left', 'right', 'antenna'):
                    self.assertTrue(all(math.isfinite(v) and abs(v) <= 2.2 for v in p[part]))
                self.assertTrue(all(abs(v) <= .22 for v in p['head']))

    def test_envelope_eases_in_and_out(self):
        self.assertEqual(module.envelope(0), 0)
        self.assertEqual(module.envelope(1), 0)
        self.assertEqual(module.envelope(.5), 1)
        self.assertLess(module.envelope(.01), .001)
        self.assertLess(module.envelope(.99), .001)


if __name__ == '__main__':
    unittest.main()
