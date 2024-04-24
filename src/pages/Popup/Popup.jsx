import React from 'react';
import { RiCharacterRecognitionLine } from "react-icons/ri";

const Popup = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-5 ">
      <button
        className='w-[125px] h-[125px] hover:bg-slate-200 rounded-full flex items-center justify-center border-[5px] bg-white border-gray-200 drop-shadow-sm'
        onClick={() => {
          chrome.windows.getAll(
            { windowTypes: ['popup'] },
            function (windows) {
              console.log(windows);
              if (windows.length) {
                chrome.windows.update(windows[0].id, {
                  focused: true,
                });
              } else {
                var optionsUrl = chrome.runtime.getURL('ocr.html');
                chrome.windows.create(
                  {
                    url: optionsUrl,
                    type: 'panel',
                    state: 'maximized'
                  }
                )
              }
            }
          )
        }}
      >
        <RiCharacterRecognitionLine className=' text-[4rem] text-black opacity-50 ' />
      </button>
    </div>

  );
};

export default Popup;
