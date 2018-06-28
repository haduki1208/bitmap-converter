const fs = require("fs");

/**
 * @param {Number} n 
 */
const toLittleEndian8ByteArray = n => n
  .toString(16)
  .padStart(8, "0")
  .match(/.{2}/g)
  .reverse()
  .map(v => parseInt("0x" + v));

/**
 * @param {Number} fileSize 
 */
const choiceSquareLength = fileSize => {
  let i = 4;
  while (i * i * 3 - 54 < fileSize) {
    i += 4;
  };
  return i;
}

fs.readFile(process.argv[2], (err, data) => {
  const file = convertBitmap(data);
  fs.writeFileSync("convert.bmp", file);
});

/**
 * @param {ArrayBuffer} buffer 
 */
function convertBitmap(buffer) {
  const squareLength = choiceSquareLength(buffer.byteLength);
  const imageSize = squareLength * squareLength * 3; // color data(3byte RGB)
  const fileSize = imageSize + 54; // header data size 54byte

  const [_fs0, _fs1, _fs2, _fs3] = toLittleEndian8ByteArray(fileSize);
  const [_iw0, _iw1, _iw2, _iw3] = toLittleEndian8ByteArray(squareLength); // width
  const [_ih0, _ih1, _ih2, _ih3] = toLittleEndian8ByteArray(squareLength); // height
  const [_is0, _is1, _is2, _is3] = toLittleEndian8ByteArray(imageSize);

  const bitmapData = new Uint8Array(fileSize);
  const bitmapHeader = new Uint8Array([
    0x42, 0x4d, _fs0, _fs1, _fs2, _fs3, 0x00, 0x00, 0x00, 0x00, 0x36, 0x00, 0x00, 0x00, 0x28, 0x00,
    0x00, 0x00, _iw0, _iw1, _iw2, _iw3, _ih0, _ih1, _ih2, _ih3, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00,
    0x00, 0x00, _is0, _is1, _is2, _is3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  const fileData = new Uint8Array(buffer);

  bitmapData.set(bitmapHeader);
  bitmapData.set(fileData, 54);
  return bitmapData;
}