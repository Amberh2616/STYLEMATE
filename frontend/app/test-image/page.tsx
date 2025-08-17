'use client'

export default function TestImagePage() {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#f8fafc'
    }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>圖片測試頁面</h1>
      
      {/* 測試圖片 1 - 原始大小 */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>原始圖片大小：</h2>
        <img 
          src="/images/korean-fashion/LINE_ALBUM__250808_78.jpg"
          alt="測試圖片"
          style={{
            border: '2px solid red',
            display: 'block'
          }}
        />
      </div>

      {/* 測試圖片 2 - 限制寬度 */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>限制寬度 300px：</h2>
        <img 
          src="/images/korean-fashion/LINE_ALBUM__250808_78.jpg"
          alt="測試圖片"
          style={{
            width: '300px',
            height: 'auto',
            border: '2px solid blue',
            display: 'block'
          }}
        />
      </div>

      {/* 測試圖片 3 - 在容器中 */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>在固定容器中：</h2>
        <div style={{
          width: '400px',
          height: '400px',
          border: '2px solid green',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/images/korean-fashion/LINE_ALBUM__250808_78.jpg"
            alt="測試圖片"
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      </div>

      {/* 測試圖片 4 - objectFit cover */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>objectFit cover (可能截斷)：</h2>
        <div style={{
          width: '400px',
          height: '300px',
          border: '2px solid orange'
        }}>
          <img 
            src="/images/korean-fashion/LINE_ALBUM__250808_78.jpg"
            alt="測試圖片"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </div>
  )
}