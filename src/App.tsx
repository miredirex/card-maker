import React from 'react';
import logo from './logo.svg';
import './App.css';
import Canvas from './components/Canvas';
import { Tool, ToolType } from './components/Tool';
import { Gizmo } from './components/Gizmo';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="tool-panel">
          <Tool toolType={ToolType.Select} />
          <Tool toolType={ToolType.MoveSelected} />
          <Tool toolType={ToolType.CropToSelect} />
          <Tool toolType={ToolType.DeleteSelection} />
          <Tool toolType={ToolType.Text} />
          <Tool toolType={ToolType.Shape} />
          <Tool toolType={ToolType.Image} />
        </div>
        <Canvas />
        <Gizmo isResizable={true} />
      </header>
    </div>
  );
}

export default App;
