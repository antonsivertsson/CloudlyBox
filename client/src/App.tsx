import React, { useState } from 'react'
import { Table, Spin, Button, Upload, Modal, Input } from 'antd'
import { InboxOutlined, FileImageTwoTone, FileExcelTwoTone, FilePdfTwoTone, FileUnknownTwoTone, DeleteOutlined } from '@ant-design/icons'
import './App.css'
import { useDeleteFileMutation, useGetFilesQuery, useUploadFileMutation } from './app/api'

function App() {

  const { data: fileList = [], isLoading } = useGetFilesQuery()
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation()
  const [uploadFile, { isLoading: uploadingFile }] = useUploadFileMutation()
  
  const [fileToUpload, setFileToUpload] = useState<File | undefined>()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileExtension, setFileExtension] = useState<string | undefined>()
  const [fileDescription, setFileDescription] = useState('')
  const [fileOwner, setFileOwner] = useState('')

  const resetFileInput = () => {
    setFileToUpload(undefined)
    setFileName('')
    setFileExtension(undefined)
    setFileDescription('')
    setShowUploadModal(false)
    // Don't reset owner, so it's preserved transiently in session
  }

  const startUpload = () => {
    // Creates a form data object to upload the file
    const formData = new FormData()

    const fullFilename = fileExtension ? [fileName, fileExtension].join('.') : fileName
    formData.append('filename', fullFilename)
    formData.append('description', fileDescription)
    formData.append('owner', fileOwner)
    if (fileToUpload) {
      // Should always exist when starting an upload
      formData.append('file', fileToUpload)
    }
    uploadFile(formData)
    // Close modal and clear data while uploading
    resetFileInput()
  }

  const cols = [
    {
      title: 'File',
      dataIndex: 'fileName',
      filters: [
        {
          text: 'JPG',
          value: '.jpg'
        },
        {
          text: 'XML',
          value: '.xml'
        },
        {
          text: 'PDF',
          value: '.pdf'
        },
      ],
      onFilter: (value: string | number | boolean, record: any) => {
        return record.fileName.indexOf(value) >= 0
      },
      render: (filename: string) => {
        let icon
        switch(filename.split('.').pop()) {
          case 'jpg':
            icon = <FileImageTwoTone style={{fontSize: '2em'}} />
            break
          case 'xml':
            icon = <FileExcelTwoTone twoToneColor="#52c41a" style={{fontSize: '2em'}} />
            break
          case 'pdf':
            icon = <FilePdfTwoTone twoToneColor="#eb2f96" style={{fontSize: '2em'}} />
            break
          default:
            icon = <FileUnknownTwoTone style={{fontSize: '2em'}} />
        }
        return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          {icon}
          <span style={{paddingLeft: '1em'}}>{filename}</span>
        </div>
      )}
    }, {
      title: 'Description',
      dataIndex: 'description'
    }, {
      title: 'Owner',
      dataIndex: 'owner',
    }, {
      title: 'Created',
      dataIndex: 'createdAt',
      sorter: (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    }, {
      title: 'Remove',
      dataIndex: 'remove',
      render: (removeKey: string) => (
        // Custom render that allows deletion of file based on key
        <Button type="primary" shape="circle" icon={<DeleteOutlined />} style={{backgroundColor: 'red'}} onClick={(event) => {
          event.stopPropagation()
          deleteFile(removeKey)
        }} />
      )
    }
  ]

  const { Dragger } = Upload

  return (
    <div>
      <Modal title="Upload file" visible={showUploadModal} onCancel={resetFileInput} onOk={startUpload}>
        <Input addonBefore="File name" addonAfter={fileExtension ? `.${fileExtension}` : null} onChange={(event) => setFileName(event.target.value)} value={fileName} />
        <Input addonBefore="Description" onChange={(event) => setFileDescription(event.target.value)} value={fileDescription} />
        <Input addonBefore="Owner" onChange={(event) => setFileOwner(event.target.value)} value={fileOwner} />
      </Modal>

      <Spin spinning={isLoading || isDeleting || uploadingFile}>
        <Table
          columns={cols}
          onRow={(row) => {
            return {
              onClick: (event) => {
                // Download file from public bucket (generate signedUrl via s3 if private)
                window.open(`http://localhost:4566/file-bucket/${row.fileName}`)
              }
            }
          }}
          dataSource={
            // transform data to add remove functionality more easily
            fileList.map(file => ({
              fileName: file.fileName,
              updatedAt: file.updatedAt,
              createdAt: file.createdAt,
              description: file.description,
              owner: file.owner,
              remove: file.fileName,
            }))
          }
          style={{cursor: 'pointer'}}
          pagination={{ defaultPageSize: 5, position: ['topRight'] }}
        />
      </Spin>

      <Dragger name="file" accept=".jpg,.xml,.pdf" showUploadList={false} multiple={false} beforeUpload={(file, fileList) => {
        const filenameArray = file.name.split('.')
        const ext = filenameArray.pop()
        const filename = filenameArray.join('.')
        setFileToUpload(file)
        setFileExtension(ext)
        setFileName(filename)
        setShowUploadModal(true)
        return false // Prevent default upload behaviour
      }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">Allows XML, JPG and PDF files</p>
      </Dragger>
    </div>
  )
}

export default App
