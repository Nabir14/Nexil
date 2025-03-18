const NoPage = ({ title = "404", text = "Not Found" }: { title?: string; text?: string }) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-svh">
			<h1 className="font-extrabold text-5xl">{title}</h1>
			<h2 className="font-extrabold text-4xl">{text}</h2>
		</div>
	);
};

export default NoPage;
