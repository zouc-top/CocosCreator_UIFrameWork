import UIManager from "./UIManager";
import { FormType } from "./config/SysDefine";
import { IFormData } from "./Struct";
import AdapterMgr from "./AdapterMgr";
import ResMgr from "./ResMgr";

export default class UIBase extends cc.Component {
    /** 窗体id,该窗体的唯一标示(请不要对这个值进行赋值操作, 内部已经实现了对应的赋值) */
    public fid: string;
    /** 窗体数据 */
    public formData: IFormData = null!;
    /** 窗体类型 */
    public formType: FormType;
    /** 关闭窗口后销毁, 会将其依赖的资源一并销毁, 采用了引用计数的管理, 不用担心会影响其他窗体 */
    public willDestory = false;
    /** 是否已经调用过preinit方法 */
    private _inited = false;

    public view: cc.Component = null!;

    /** 预先初始化 */
    public async _preInit(params: any) {
        if(this._inited) return ;
        this._inited = true;
        this.view = this.getComponent(`${this.node.name}_Auto`);
        // 加载这个UI依赖的其他资源
        let errorMsg = await this.load(params);
        if(errorMsg) {
            cc.error(errorMsg);
            this.closeSelf();
            return ;
        }
        this.onInit(params);
    }

    model: any = null; 

    /** 可以在这里进行一些资源的加载, 具体实现可以看test下的代码 */
    public async load(params: any): Promise<string> {
        return null;
    }

    /** 初始化, 只调用一次 */
    public onInit(params: any) {}
    // 显示回调
    public onShow(params: any) {}
    // 在显示动画结束后回调
    public onAfterShow(params: any) {}
    // 隐藏回调
    public onHide() {}    
    // 在隐藏动画结束后回调
    public onAfterHide() {}

    // 关闭自己
    public async closeSelf(): Promise<boolean> {
       return await UIManager.getInstance().closeForm(this.fid);
    }

    /**
     * 弹窗动画
     */
    public async showEffect() {}
    public async hideEffect() {}

    /** 设置是否挡住触摸事件 */
    private _blocker: cc.BlockInputEvents = null;
    public setBlockInput(block: boolean) {
        if(!this._blocker)  {
            let node = new cc.Node('block_input_events');
            this._blocker = node.addComponent(cc.BlockInputEvents);
            this._blocker.node.setContentSize(AdapterMgr.inst.visibleSize);
            this.node.addChild(this._blocker.node, cc.macro.MAX_ZINDEX);
        }
        this._blocker.node.active = block;
    }

    public async loadRes(url: string, type?: typeof cc.Asset) {
        return await ResMgr.inst.loadDynamicRes(url, type, this.fid);
    }
}

//@ts-ignore
cc.UIBase = UIBase;