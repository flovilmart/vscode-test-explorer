import * as vscode from 'vscode';
import { TestItem } from './adapter/api';

type IconPath = string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri };

export class TestExplorerTree {

	constructor(
		public readonly root: TestExplorerItem,
		public readonly itemsById: Map<string, TestExplorerItem>
	) {}

	static from(
		testItem: TestItem,
		oldTree: TestExplorerTree | undefined,
		defaultIconPath: IconPath
	): TestExplorerTree {

		const itemsById = new Map<string, TestExplorerItem>();
		const oldItemsById = oldTree ? oldTree.itemsById : undefined;
		const root = transform(testItem, itemsById, oldItemsById, defaultIconPath);

		return new TestExplorerTree(root, itemsById);
	}
}

export class TestExplorerItem extends vscode.TreeItem {
	constructor(
		public readonly testItem: TestItem,
		public readonly children: TestExplorerItem[],
		collapsibleState: vscode.TreeItemCollapsibleState | undefined,
		iconPath?: IconPath
	) {
		super(testItem.label, collapsibleState);
		this.iconPath = iconPath;
	}
}

function transform(
	item: TestItem,
	itemsById: Map<string, TestExplorerItem>,
	oldItemsById: Map<string, TestExplorerItem> | undefined,
	defaultIconPath: IconPath
): TestExplorerItem {

	const oldItem = oldItemsById ? oldItemsById.get(item.id) : undefined;
	let result: TestExplorerItem;

	if (item.type === 'suite') {

		const children = item.children.map(
			(child) => transform(child, itemsById, oldItemsById, defaultIconPath));
		const collapsibleState = oldItem ? oldItem.collapsibleState : vscode.TreeItemCollapsibleState.Collapsed;

		result = new TestExplorerItem(item, children, collapsibleState);

	} else {

		result = new TestExplorerItem(item, [], vscode.TreeItemCollapsibleState.None, defaultIconPath);

	}

	itemsById.set(item.id, result);

	return result;
}