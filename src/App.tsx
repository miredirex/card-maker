import { useRef, useState } from 'react';
import './App.css';
import Canvas, { CANVAS_DEFAULT_HEIGHT, CANVAS_DEFAULT_WIDTH } from 'components/Canvas';
import Tool, { ToolType } from 'components/Tool';
import Action from 'components/Action'
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
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const importInputRef = useRef<HTMLInputElement>(null)

    const addRandomImage = () => {
        // Random param prevents caching
        addImage(`https://picsum.photos/500/300?random=${Math.random()}`)
    }

    const addImage = (url: string) => {
        setImages([...images, url])
    }

    const onImageImported = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0)
        if (file) {
            addImage(URL.createObjectURL(file))
        }
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
                    <div className="toolbar">
                        <div className="buttons-container">
                            <Action icon={<ChevronDownIcon />} id="action-file-menu" onClick={() => { }}>File</Action>
                            <Tool isSelected={selectedTool === ToolType.Select} icon={<FrameIcon />} onClick={() => setTool(ToolType.Select)} toolType={ToolType.Select} />
                            <Tool isSelected={selectedTool === ToolType.Text} icon={<CursorTextIcon />} onClick={() => setTool(ToolType.Text)} toolType={ToolType.Text} />
                            <Tool isSelected={selectedTool === ToolType.Shape} icon={<PyramidIcon />} onClick={() => setTool(ToolType.Shape)} toolType={ToolType.Shape} />
                            <Action id="action-random-image" icon={<DiceIcon />} onClick={(e) => { addRandomImage(); e.currentTarget.blur() }}>Random Image</Action>
                        </div>
                        <div className="buttons-container">
                            <Action icon={<FileImportIcon />} id="action-import" onClick={(e) => { importImage(); e.currentTarget.blur() } }>
                                <input accept=".jpg, .jpeg, .png" onChange={onImageImported} ref={importInputRef} id="import-input" type="file" hidden />
                                Import...
                            </Action>
                            <Action icon={<FileExportIcon />} id="action-export" onClick={() => exportImage('png')}>Export...</Action>
                        </div>
                    </div>
                    <Canvas
                        canvasRef={canvasRef}
                        width={CANVAS_DEFAULT_WIDTH}
                        height={CANVAS_DEFAULT_HEIGHT}
                        images={images}
                        onRemoveImg={removeImage}
                        tool={selectedTool} />
                    <div className="controls">
                        <span>
                            <kbd>Enter</kbd> to draw selected item, <kbd>Del</kbd> to erase selected area
                        </span>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default App;
