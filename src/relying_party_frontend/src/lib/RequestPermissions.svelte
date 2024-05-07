<script lang="ts">
	import { popupTopRight } from '$core/utils/window.utils';
	import {
		WALLET_POPUP_HEIGHT,
		WALLET_POPUP_WIDTH
	} from '$core/constants/app.constants';

	let tab: WindowProxy | null | undefined;

	const onclick = () => {
		tab = window.open(
			'http://localhost:5174',
			'walletWindow',
			popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
		);
	};

	$effect(() => {
		return () => tab?.close();
	});
</script>

<button {onclick}>Request Wallet Permissions</button>
