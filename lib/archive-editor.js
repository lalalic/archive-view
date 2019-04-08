const fs = require('fs-plus')
const path = require('path')
const {Disposable} = require('atom')

const getIconServices = require('./get-icon-services')
const ArchiveEditorView = require('./archive-editor-view')

module.exports = {
    config:{
        "supportedFileExts":{
            type:"string",
            default:".docx,.pptx,.xlsx",
        }
    },
  activate () {
    this.disposable = atom.workspace.addOpener((filePath = '') => {
      // Check that filePath exists before opening, in case a remote URI was given
      if (isPathSupported(filePath) && fs.isFileSync(filePath)) {
        return new ArchiveEditorView(filePath)
      }
    })
  },

  deactivate () {
    this.disposable.dispose()
    for (const item of atom.workspace.getPaneItems()) {
      if (item instanceof ArchiveEditorView) {
        item.destroy()
      }
    }
  },

  consumeElementIcons (service) {
    getIconServices().setElementIcons(service)
    return new Disposable(() => getIconServices().resetElementIcons())
  },

  consumeFileIcons (service) {
    getIconServices().setFileIcons(service)
    return new Disposable(() => getIconServices().resetFileIcons())
  },

  deserialize (params = {}) {
    if (fs.isFileSync(params.path)) {
      return new ArchiveEditorView(params.path)
    } else {
      console.warn(`Can't build ArchiveEditorView for path "${params.path}"; file no longer exists`)
    }
  }
}

function isPathSupported (filePath) {
    const ext=path.extname(filePath)
  switch (ext) {
    case '.egg':
    case '.epub':
    case '.jar':
    case '.love':
    case '.nupkg':
    case '.tar':
    case '.tgz':
    case '.war':
    case '.whl':
    case '.xpi':
    case '.zip':
      return true
    case '.gz':
      return path.extname(path.basename(filePath, '.gz')) === '.tar'
    default://ls-archive be hacked (module.exports.zips=".docx,...") to support zip like file ext
        return (require("ls-archive").zips=atom.config.get("view-archive.supportedFileExts")||"").split(",").includes(ext)
  }
}
