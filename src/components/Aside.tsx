import { Plus } from "lucide-react";
import React from "react";

const Aside: React.FC = () => {
	return (
		<aside className="flex flex-col select-none max-sm:hidden max-w-72 min-h-svh max-h-svh w-full overflow-x-hidden overflow-y-auto scroll-w-none bg-neutral-900">
			<section className="sticky top-0 flex items-center justify-between p-2 bg-neutral-900">
				<div className="flex items-center">
					<img
						src="https://nexil.vercel.app/static/media/nexil-icon-transparent.4514cfeec979d24532f5.png"
						width={48}
						height={48}
						alt="profile"
						className="shrink-0 object-cover rounded-full size-12"
					/>
					<h1 className="font-extrabold text-2xl">Nexil</h1>
				</div>
				<button className="flex items-center justify-center cursor-pointer rounded-full p-1 transition hover:bg-neutral-800 hover:text-white active:bg-neutral-800 active:text-white">
					<Plus />
				</button>
			</section>
			<section className="flex flex-nowrap gap-1 cursor-pointer w-full p-2 transition hover:bg-neutral-800 active:bg-neutral-800">
				<img
					src="https://picsum.photos/200/300 "
					width={48}
					height={48}
					alt="profile"
					className="shrink-0 object-cover rounded-full size-12"
					loading="lazy"
				/>
				<div className="flex flex-col truncate w-full">
					<h2 className="truncate font-bold">Public Chat</h2>
					<span className="truncate text-sm">
						A chat room to talk with multiple people from across the world.
					</span>
				</div>
			</section>
		</aside>
	);
};

export default Aside;
