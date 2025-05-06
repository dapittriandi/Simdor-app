const renderFileUploadSection = () => {
    if (formData.noSiSpk) {
      return (
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-500" />
            Dokumen SI/SPK <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-4">
            {getFieldErrorDisplay("siSpkFile")}
            {touchedFields["siSpkFile"] && fieldErrors.siSpkFile && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {fieldErrors.siSpkFile}
              </div>
            )}
            
            <div 
              className={`border-2 ${
                isDragging ? "border-blue-400 bg-blue-50" : 
                touchedFields["file.siSpk"] && fieldErrors.siSpkFile 
                  ? "border-red-300" 
                  : "border-dashed border-gray-300"
              } rounded-lg p-6 text-center hover:bg-gray-50 transition-colors`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="file-upload" 
                ref={fileInputRef}
                name="siSpkFile"
                onChange={handleFileChange} 
                className="sr-only"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: '0',
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  borderWidth: '0'
                }}
                required={formData.noSiSpk ? true : false}
                aria-required={formData.noSiSpk ? "true" : "false"}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                {filePreview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-600">{files.siSpk?.name}</span>
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg inline-block">
                      Ubah file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {isDragging ? "Lepaskan file di sini" : "Klik atau tarik file ke sini"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF atau JPEG. Max 5MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {getFieldErrorDisplay("siSpkFile")}
          </div>
        </div>
      );
    }
    return null;
  };