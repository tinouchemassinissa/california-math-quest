"""Pure trajectory checks; rendering and pose review are separate checks."""
import importlib.util
import math
from pathlib import Path
import sys
import types
import unittest

# Pose equations can be checked without installing Blender in the app runtime.
sys.modules.setdefault('bpy', types.ModuleType('bpy'))
spec = importlib.util.spec_from_file_location('school_gestures_v2', Path(__file__).with_name('render_school_gestures_v2.py'))
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

    def test_joint_and_gaze_limits(self):
        for take in module.TAKES:
            for i in range(181):
                p=module.pose(take,i/180)
                self.assertTrue(all(abs(v)<=.26 for v in p['elbow']+p['wrist']))
                self.assertLessEqual(abs(p['gaze'][0]),.026)
                self.assertLessEqual(abs(p['gaze'][1]),.013)
        self.assertEqual(module.FPS,30)

    def test_envelope_eases_in_and_out(self):
        self.assertEqual(module.envelope(0), 0)
        self.assertEqual(module.envelope(1), 0)
        self.assertEqual(module.envelope(.5), 1)
        self.assertLess(module.envelope(.01), .001)
        self.assertLess(module.envelope(.99), .001)


if __name__ == '__main__':
    unittest.main()
