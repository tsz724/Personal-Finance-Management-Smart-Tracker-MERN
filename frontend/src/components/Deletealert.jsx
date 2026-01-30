import React from 'react'

const Deletealert = ({ content, onDelete }) => {
  return (
    <div>
      <p className="text-sm px-4" >{content}</p>

      <div className="flex justify-end mt-6 px-6 pb-6">
        <button
          type="button"
          className="add-btn add-btn-fill "
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default Deletealert;