import React, { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import { FaRegCopy } from "react-icons/fa6";
import ReactCrop from "react-image-crop";

const OCRApp = () => {
    const [image, setImage] = useState();
    const [text, setText] = useState();
    const [recogState, setRecogState] = useState();

    const handlePreviewImage = (e) => {
        console.log(e);
        const file = e.target.files;
        createOURL(file[0]);
    }

    const createOURL = (file) => {
        if (!file) return;
        file.preview = URL.createObjectURL(file);
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
        let alpha = h / img.naturalHeight;
        let ctx = c.getContext('2d');
        ctx.clearRect(0, 0, w, h)
        ctx.beginPath();
        let bboxs = words.map((value) => value.bbox);
        console.log(alpha);
        bboxs.forEach((box) => {
            ctx.strokeStyle = 'red';
            ctx.rect((box.x0 - 2) * alpha, (box.y0 - 2) * alpha, (box.x1 - box.x0 + 2) * alpha, (box.y1 - box.y0 + 2) * alpha);
            ctx.stroke();
        })
    }


    const recognizeCharacters = async () => {
        if (!image) {
            alert('Bạn chưa chọn ảnh');
            return;
        }
        const lang = document.getElementById('lang');
        const worker = await createWorker(
            lang.value,
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
        <div className=" relative flex justify-center items-center gap-5 flex-col bg-slate-200 w-full h-full">
            <div id="dropArea" className=" text-center p-2 text-base ml-5 mr-5 cursor-pointer text-white bg-sky-300 border-[10px] border-sky-400 shadow-md duration-100 hover:scale-110 w-[300px] h-[100px] rounded-full ">
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

            <div className="w-[85%] h-[70%] rounded-3xl justify-center gap-5 shadow-lg items-center flex bg-gray-400 " >
                <div className=" relative flex justify-center items-center w-[40%] h-[80%] rounded-3xl bg-gray-100 ">
                    <canvas id="canvas" className="z-10 absolute"></canvas>
                    {image && <img className=" max-w-[100%] max-h-[100%] " src={image.preview} alt={image.name} />}
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
                    <span className=" text-center text-white font-medium text-sm ">
                        Chọn ngôn ngữ đọc:
                    </span>
                    <select name="lang" id="lang" className=" w-[75%] h-[15%] outline-none font-medium" >
                        <option value="vie"> TIếng Việt</option>
                        <option value="eng"> TIếng Anh</option>
                    </select>
                </div>


                <div className="w-[40%] h-[80%] rounded-3xl bg-gray-100 relative ">
                    <textarea
                        readOnly
                        value={text}
                        className="p-10 text-lg rounded-2xl h-full w-full resize-none bg-transparent outline-none">
                    </textarea>
                    <button
                        className=" bg-cyan-100 active:bg-cyan-200 duration-200 hover:bg-red-200 rounded-full absolute w-[50px] h-[50px] right-2 top-2 p-2 flex items-center justify-center "
                        onClick={() => {
                            navigator.clipboard.writeText(text);
                        }}
                    >
                        <FaRegCopy className=" text-3xl font-extrabold text-cyan-400 " />
                    </button>
                </div>

            </div>
        </div>
    )
}

export default OCRApp;