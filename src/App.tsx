import { useRef, useState } from 'react';
import './App.css';
import Canvas, { CANVAS_DEFAULT_HEIGHT, CANVAS_DEFAULT_WIDTH } from 'components/Canvas';
import Tool, { ToolType } from 'components/Tool';
import { ReactComponent as ChevronDownIcon } from 'icons/chevron-down.svg';
import { ReactComponent as FrameIcon } from 'icons/frame.svg';
import { ReactComponent as PyramidIcon } from 'icons/pyramid.svg';
import { ReactComponent as FileExportIcon } from 'icons/file-export.svg';
import { ReactComponent as FileImportIcon } from 'icons/file-import.svg';
import { ReactComponent as CursorTextIcon } from 'icons/cursor-text.svg';
import { ReactComponent as DiceIcon } from 'icons/dice.svg';

function downloadImage(dataURL: string, filename: string) {
    var a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a)
}

function App() {
    const [selectedTool, setTool] = useState(ToolType.Select)
    const [images, setImages] = useState<string[]>([])
    const [url, setUrl] = useState('https://picsum.photos/500/300')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const importInputRef = useRef<HTMLInputElement>(null)

    const addImage = (url: string) => {
        setImages([...images, url])
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const exportImage = (format: string) => {
        const dataURL = canvasRef.current!.toDataURL(`image/${format}`);
        downloadImage(dataURL, `image.${format}`)
    }

    const importImage = () => {
        importInputRef.current!.click()
    }

    return (
        <div>
            <header className="app-header">
                <div>
                    <div className="tool-panel">
                        <button id="file-menu" className="toolbar-item"><ChevronDownIcon /> File</button>
                        <Tool icon={<FrameIcon />} onClick={() => setTool(ToolType.Select)} toolType={ToolType.Select} />
                        <Tool icon={<CursorTextIcon />} onClick={() => setTool(ToolType.Text)} toolType={ToolType.Text} />
                        <Tool icon={<PyramidIcon />} onClick={() => setTool(ToolType.Shape)} toolType={ToolType.Shape} />
                        <Tool icon={<DiceIcon />} onClick={() => { setTool(ToolType.RandomImage); addImage(url) }} toolType={ToolType.RandomImage} />
                        <button id="import" onClick={() => importImage()} className="toolbar-item" style={{ marginLeft: 'auto' }}>
                            {<FileImportIcon />}
                            <input ref={importInputRef} id="import-input" type="file" hidden />
                            Import...
                        </button>
                        <button
                            id="export"
                            onClick={() => exportImage('png')}
                            className="toolbar-item">
                            {<FileExportIcon/>}
                            Export...
                        </button>
                    </div>
                    <Canvas
                        canvasRef={canvasRef}
                        width={CANVAS_DEFAULT_WIDTH}
                        height={CANVAS_DEFAULT_HEIGHT}
                        images={images}
                        onRemoveImg={removeImage}
                        tool={selectedTool} />
                </div>
            </header>
        </div>
    );
}

export default App;
