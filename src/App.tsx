import { useState } from 'react'
import Resume from './components/Resume'
import './App.css'

function App() {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="app">
      <div className="controls">
        <label className="upload-button">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          {profileImage ? 'Change Profile Image' : 'Upload Profile Image'}
        </label>
      </div>
      <Resume profileImage={profileImage} />
    </div>
  )
}

export default App
