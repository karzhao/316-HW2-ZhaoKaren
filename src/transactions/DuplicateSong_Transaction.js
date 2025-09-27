import { jsTPS_Transaction } from 'jstps';

export default class DuplicateSong_Transaction extends jsTPS_Transaction {
  constructor(app, index) {
    super();
    this.app = app;
    this.index = index;        // duplicate this index
    this.copy = null;          // cached copy for redo symmetry
  }
  executeDo() {
    if (!this.copy) {
      const original = this.app.getSongAt(this.index);
      this.copy = { ...original, title: `${original.title} (Copy)` };
    }
    this.app.addSongAt(this.index + 1, this.copy);
  }
  executeUndo() {
    this.app.deleteSongAt(this.index + 1);
  }
}
