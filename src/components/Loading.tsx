const Loading = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <p className="font-extrabold text-sm">{text}</p>
    </div>
  );
};

export default Loading;
