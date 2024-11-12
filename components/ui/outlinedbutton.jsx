export default function OutlinedButton({ children, className, onClick }) {
    return (
      <button
        className={`border-2 border-green-500 text-green-500 font-semibold py-3 px-6 rounded-md text-xl shadow-lg hover:bg-green-500 hover:text-white transition duration-300 ease-in-out ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  