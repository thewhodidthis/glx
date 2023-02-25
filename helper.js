// Helps read in files as text, useful when loading shaders.
export async function textreader(name) {
  try {
    return await fetch(name).then(r => r.text())
  } catch (e) {
    throw e
  }
}
