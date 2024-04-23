import React, { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

const OCRApp = () => {
    const [image, setImage] = useState();
    const [text, setText] = useState();
    const [recogState, setRecogState] = useState();

    const handlePreviewImage = (e) => {
        const file = e.target.files[0] || e.dataTransfer.files[0];
        createOURL(file);
    }

    const createOURL = (file) => {
        if (!file) return;
        file.preview = URL.createObjectURL(file);
        console.log(file);
        clear();
        setImage(file);
    }

    useEffect(() => {
        return () => {
            (image && URL.revokeObjectURL(image.preview));
        }
    }, [image]);

    useEffect(() => {
        const dropArea = document.getElementById('dropArea');
        console.log(dropArea);
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
        })
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            createOURL(e.dataTransfer.files[0]);
        })
    }, [])

    const clear = () => {
        let c = document.getElementById('canvas');
        if (!c) return;
        let ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
    }

    const draw = (words) => {
        let img = document.querySelector('img');
        let h = img.clientHeight;
        let w = img.clientWidth;
        let c = document.getElementById('canvas');
        c.height = h;
        c.width = w;
        let ctx = c.getContext('2d');
        ctx.clearRect(0, 0, w, h)
        ctx.beginPath();
        let bboxs = words.map((value) => value.bbox);
        bboxs.forEach((box) => {
            ctx.strokeStyle = 'red';
            ctx.rect(box.x0 - 2, box.y0 - 2, box.x1 - box.x0 + 2, box.y1 - box.y0 + 2);
            ctx.stroke();
        })
    }


    const recognizeCharacters = async () => {
        if (!image) {
            alert('Bạn chưa chọn ảnh');
            return;
        }
        const worker = await createWorker(
            'eng',
            1,
            {
                corePath: "tesseract-core-simd.wasm.js",
                workerPath: "worker.min.js",
                workerBlobURL: false,
                logger: m => { setRecogState(m.status + ": \n " + Math.round(m.progress * 100) + "%") }
            }

        );
        const ret = await worker.recognize(image);
        console.log(ret);
        draw(ret.data.words);
        setText(ret.data.text);
        await worker.terminate();

    }

    return (
        <div className=" relative flex justify-center items-center gap-5 flex-col bg-red-100 w-full h-full">
            <div id="dropArea" className=" text-center p-2 text-base ml-5 mr-5 cursor-pointer text-white bg-sky-500 w-[300px] h-[100px] rounded-full ">
                <input className="hidden"
                    type="file"
                    id="input"
                    accept="image/*"
                    onChange={handlePreviewImage}
                />
                <label htmlFor="input" className="cursor-pointer">
                    <strong>Kéo thả ảnh</strong> <br /> hoặc <br /> <strong>nhấn vào đây để chọn ảnh</strong>
                </label>
            </div>

            <div className="w-[85%] h-[70%] rounded-3xl justify-center gap-5 items-center flex bg-red-300" >
                <div className=" relative flex justify-center items-center w-[40%] h-[80%] rounded-3xl bg-sky-200 ">
                    <canvas id="canvas" className=" absolute"></canvas>
                    {image && <img className="max-w-[100%] max-h-[100%] " src={image.preview} alt={image.name} />}
                </div>

                <div className="w-[10%] h-[20%] flex flex-col items-center justify-around">
                    <span className=" text-center text-white font-medium text-sm ">
                        {recogState}
                    </span>
                    <button
                        className=" rounded-full w-full h-[40%] p-4 font-medium text-lg text-white bg-green-500 "
                        onClick={recognizeCharacters}
                    >
                        Trích Xuất
                    </button>
                </div>


                <div className="w-[40%] h-[80%] rounded-3xl bg-sky-200 ">
                    <textarea
                        readOnly
                        value={text}
                        className="p-10 text-sm rounded-2xl h-full w-full resize-none bg-transparent outline-none">
                    </textarea>
                </div>
            </div>
        </div>
    )
}

export default OCRApp;