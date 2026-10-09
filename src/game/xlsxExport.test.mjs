import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkbookBlob } from '../export/xlsxExport.js';

test('createWorkbookBlob creates a valid XLSX Blob without external dependencies', async () => {
  const sheets = [
    {
      name: 'Classroom Summary',
      rows: [
        ['Metric', 'Value'],
        ['School', 'Fammatre Elementary'],
        ['Total Students', 24],
        ['Accuracy', 92.5],
      ],
    },
    {
      name: 'Attempts Log',
      rows: [
        ['Timestamp', 'Student', 'Grade', 'Standard', 'Result'],
        ['2026-10-09T00:00:00Z', 'Leo', 'Grade 3', '3.OA.C.7', 'Correct'],
      ],
    },
  ];

  const blob = createWorkbookBlob(sheets);
  assert.ok(blob, 'Blob should be created');
  assert.equal(
    blob.type,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  const arrayBuffer = await blob.arrayBuffer();
  assert.ok(arrayBuffer.byteLength > 100, 'Array buffer should contain zip bytes');

  // Verify PK zip signature (0x50, 0x4b, 0x03, 0x04)
  const bytes = new Uint8Array(arrayBuffer);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  assert.equal(bytes[2], 0x03);
  assert.equal(bytes[3], 0x04);
});
