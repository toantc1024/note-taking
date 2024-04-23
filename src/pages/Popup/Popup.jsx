import React from 'react';

const Popup = () => {

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-5 ">
      <button
        className='w-[150px] h-[75px] rounded-full border-[2px] bg-red-500 border-gray-200 drop-shadow-sm'
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
      ></button>
      <button
        className='w-[150px] h-[75px] rounded-full border-[2px] bg-red-500 border-gray-200 drop-shadow-sm'
      ></button>
    </div>

  );
};

export default Popup;
