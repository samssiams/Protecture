export default function Button({ children, className, onClick }) {
    return (
      <button
        className={`bg-green-500 text-white font-semibold py-3 px-6 rounded-md text-xl shadow-lg hover:bg-green-600 transition duration-300 ease-in-out ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  