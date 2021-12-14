import { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import { Tool, ToolType } from './components/Tool';
import { FlexibleComponent } from './components/FlexibleComponent';

function App() {
  const [selectedTool, setTool] = useState(ToolType.Select)
  const [images, setImages] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const addImage = (url: string) => {
    setImages(images.concat(url))
  }

  return (
    <div>
      <header className="app-header">
        <div>
          <span style={{fontSize: 14}}>https://picsum.photos/500/300/?random</span>
          <div className="tool-panel">
            <Tool onClick={() => setTool(ToolType.Select)} toolType={ToolType.Select} />
            <Tool onClick={() => setTool(ToolType.Text)} toolType={ToolType.Text} />
            <Tool onClick={() => setTool(ToolType.Shape)} toolType={ToolType.Shape} />
            <Tool onClick={() => {setTool(ToolType.Image); addImage(url)}} toolType={ToolType.Image} />
            <input value={url} placeholder="url" onChange={(e) => setUrl(e.target.value)} />
          </div>
          <Canvas tool={selectedTool}>
            {images.map((url) => 
              <FlexibleComponent key={url} isGizmoVisible={selectedTool === ToolType.Select} isResizable={true}>
                <img style={{display: 'block'}} alt="" src={url} /> 
              </FlexibleComponent>
            )}
          </Canvas>
        </div>
      </header>
    </div>
  );
}

export default App;
