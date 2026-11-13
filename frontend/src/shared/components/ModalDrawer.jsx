export const ModalDrawer = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #dfe7f1',
        boxShadow: '-10px 0 25px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideLeft 0.25s ease-out'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #dfe7f1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1d2736', margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#627087',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          flex: 1,
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
