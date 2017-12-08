const fs = require('fs-plus')
const path = require('path')
const {Disposable, Emitter, File} = require('atom')

const getIconServices = require('./get-icon-services')
const ArchiveEditorView = require('./archive-editor-view')

module.exports =

class ArchiveEditor {
  static activate () {
    return atom.workspace.addOpener((filePath = '') => {
      // Check that filePath exists before opening, in case a remote URI was given
      if (isPathSupported(filePath) && fs.isFileSync(filePath)) {
        return new ArchiveEditor({path: filePath})
      }
    })
  }

  static consumeElementIcons (service) {
    getIconServices().setElementIcons(service)
    return new Disposable(() => getIconServices().resetElementIcons())
  }

  static consumeFileIcons (service) {
    getIconServices().setFileIcons(service)
    return new Disposable(() => getIconServices().resetFileIcons())
  }

  static deserialize (params = {}) {
    if (fs.isFileSync(params.path)) {
      return new ArchiveEditor({path: params.path})
    } else {
      console.warn(`Can't build ArchiveEditor for path "${params.path}"; file no longer exists`)
    }
  }

  constructor ({path}) {
    this.emitter = new Emitter()
    this.file = new File(path)
    this.view = new ArchiveEditorView(this)
    this.element = this.view.element
  }

  copy () {
    return new ArchiveEditor({
      path: this.getPath()
    })
  }

  destroy () {
    this.view.destroy()
    this.emitter.emit('did-destroy')
  }

  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  serialize () {
    return {
      deserializer: this.constructor.name,
      path: this.getPath()
    }
  }

  getPath () {
    return this.file.getPath()
  }

  getTitle () {
    const fullPath = this.getPath()
    return fullPath ? path.basename(fullPath) : 'untitled'
  }

  getURI () {
    return this.getPath()
  }
}

function isPathSupported (filePath) {
  switch (path.extname(filePath)) {
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
    default:
      return false
  }
}