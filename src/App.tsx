import { useRef, useState } from 'react';
import './App.css';
import Canvas, { CANVAS_DEFAULT_HEIGHT, CANVAS_DEFAULT_WIDTH } from 'components/Canvas';
import Tool, { ToolType } from 'components/Tool';

function App() {
  const [selectedTool, setTool] = useState(ToolType.Select)
  const [images, setImages] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const addImage = (url: string) => {
    setImages([...images, url])
  }
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const exportImage = () => {
    const dataURL = canvasRef.current!.toDataURL("image/png");
    downloadImage(dataURL)
  }

  const downloadImage = (data: string, filename = 'image.png') => {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a)
}

  return (
    <div>
      <header className="app-header">
        <div>
          <span onClick={() => setUrl('https://picsum.photos/500/300/?random')} style={{ fontSize: 14, cursor: 'pointer' }}>https://picsum.photos/500/300/?random</span>
          <div className="tool-panel">
            <Tool onClick={() => setTool(ToolType.Select)} toolType={ToolType.Select} />
            <Tool onClick={() => setTool(ToolType.Text)} toolType={ToolType.Text} />
            <Tool onClick={() => setTool(ToolType.Shape)} toolType={ToolType.Shape} />
            <Tool onClick={() => { setTool(ToolType.Image); addImage(url) }} toolType={ToolType.Image} />
            <input className="toolbar-item" value={url} placeholder="url" onChange={(e) => setUrl(e.target.value)} />
            <button id="export" onClick={() => exportImage()} className="toolbar-item" style={{ marginLeft: 'auto' }}>Export...</button>
          </div>
          <Canvas canvasRef={canvasRef} width={CANVAS_DEFAULT_WIDTH} height={CANVAS_DEFAULT_HEIGHT} images={images} onRemoveImg={removeImage} tool={selectedTool} />
        </div>
      </header>
    </div>
  );
}

export default App;
